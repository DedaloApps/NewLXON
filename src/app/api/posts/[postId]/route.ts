// src/app/api/posts/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// PATCH - Atualizar caption
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { caption } = await req.json();
    const { postId } = await context.params; // ✅ Await aqui

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    if (post.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Não tens permissão para editar este post" },
        { status: 403 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { caption },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar post:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar post" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar post
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { postId } = await context.params; // ✅ Await aqui

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    if (post.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Não tens permissão para eliminar este post" },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    console.log(`🗑️ Post eliminado: ${postId}`);

    return NextResponse.json({
      success: true,
      message: "Post eliminado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao eliminar post:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao eliminar post" },
      { status: 500 }
    );
  }
}